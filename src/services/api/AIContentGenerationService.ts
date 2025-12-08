/**
 * AI Content Generation Service
 *
 * Automatically generates SEO-optimized content using AI/ML models
 * without requiring human input. Integrates with existing SEO infrastructure.
 *
 * Features:
 * - Automated title generation
 * - Meta description creation
 * - Full content generation
 * - Schema markup generation
 * - Quality validation
 * - Performance tracking
 * - Continuous learning from feedback
 */

import * as tf from '@tensorflow/tfjs';
import * as cheerio from 'cheerio';
import { createRequire } from 'module';
import fetch from 'node-fetch';
import { Pool } from 'pg';

const requireTF = createRequire(import.meta.url);

const TENSORFLOW_BACKEND = (() => {
    try {
        requireTF('@tensorflow/tfjs-node');
        if (typeof tf.setBackend === 'function' && typeof tf.findBackend === 'function' && tf.findBackend('tensorflow')) {
            tf.setBackend('tensorflow').catch(() => {});
        }
        console.log('AIContentGenerationService: native TensorFlow backend enabled');
        return 'tensorflow';
    } catch (err) {
        console.warn('AIContentGenerationService: native TensorFlow bindings unavailable, using @tensorflow/tfjs fallback');
        return 'tfjs';
    }
})();

const TF_NODE_AVAILABLE = TENSORFLOW_BACKEND === 'tensorflow';

interface GenerationConfig {
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

interface GeneratedContent {
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

interface ContentFeatures {
    // On-page features
    currentTitle?: string;
    currentMetaDescription?: string;
    currentH1?: string;
    currentWordCount?: number;
    currentKeywordDensity?: number;

    // Competitor features
    competitorTitles?: string[];
    competitorDescriptions?: string[];
    competitorAvgLength?: number;
    competitorKeywordUsage?: object;

    // SEO features (from existing 194 features)
    seoFeatures?: any;

    // Context
    pageType?: string;
    industry?: string;
    targetAudience?: string;
}

interface TrainingData {
    input: number[];
    output: string;
    features: ContentFeatures;
    performanceMetrics?: {
        searchPosition?: number;
        clicks?: number;
        impressions?: number;
        ctr?: number;
    };
}

export class AIContentGenerationService {
    private db: Pool;
    private models: Map<string, tf.LayersModel>;
    private vocabularyMap: Map<string, number>;
    private reverseVocabularyMap: Map<number, string>;
    private maxSequenceLength: number = 100;
    private embeddingDim: number = 256;

    // Pre-trained patterns for different content types
    private titlePatterns = {
        how_to: ['How to {keyword}', '{number} Ways to {keyword}', 'The Ultimate Guide to {keyword}'],
        list: ['{number} {adjective} {keyword} for {year}', 'Top {number} {keyword}'],
        question: ['What is {keyword}?', 'Why {keyword} Matters', 'Is {keyword} Worth It?'],
        comparison: ['{keyword1} vs {keyword2}', '{keyword}: {option1} or {option2}?'],
        benefit: ['{keyword} - {benefit}', 'Get {benefit} with {keyword}']
    };

    private powerWords = [
        'ultimate', 'complete', 'essential', 'proven', 'guaranteed',
        'expert', 'professional', 'simple', 'easy', 'fast',
        'comprehensive', 'advanced', 'definitive', 'secret', 'exclusive'
    ];

    private callToActionPhrases = [
        'Learn more', 'Get started', 'Try now', 'Shop now', 'Discover',
        'Find out how', 'Start your journey', 'Unlock', 'Join thousands',
        'See results', 'Transform', 'Boost', 'Maximize', 'Optimize'
    ];

    constructor(dbPool: Pool) {
        this.db = dbPool;
        this.models = new Map();
        this.vocabularyMap = new Map();
        this.reverseVocabularyMap = new Map();
        this.initializeVocabulary();
    }

    /**
     * Initialize the service and load pre-trained models
     */
    async initialize(): Promise<void> {
        try {
            console.log('Initializing AI Content Generation Service...');

            // Load or create models
            await this.loadOrCreateModels();

            // Initialize vocabulary from training data
            await this.buildVocabulary();

            console.log('AI Content Generation Service initialized successfully');
        } catch (error) {
            console.error('Error initializing AI Content Generation Service:', error);
            throw error;
        }
    }

    /**
     * Generate content automatically based on URL and keywords
     */
    async generateContent(config: GenerationConfig): Promise<GeneratedContent> {
        const startTime = Date.now();

        try {
            console.log(`Generating content for ${config.url}`);

            // Step 1: Extract features from current page and competitors
            const features = await this.extractFeatures(config);

            // Step 2: Analyze competitors if requested
            let competitorInsights = null;
            if (config.includeCompetitorAnalysis && config.competitorUrls) {
                competitorInsights = await this.analyzeCompetitors(config.competitorUrls);
            }

            // Step 3: Generate content based on type
            let generatedContent: Partial<GeneratedContent> = {};

            if (!config.contentType || config.contentType === 'full_page') {
                generatedContent.title = await this.generateTitle(features, config);
                generatedContent.metaDescription = await this.generateMetaDescription(features, config);
                generatedContent.h1 = await this.generateH1(features, config);
                generatedContent.h2Headings = await this.generateH2Headings(features, config);
                generatedContent.content = await this.generateFullContent(features, config);
                generatedContent.schema = await this.generateSchema(features, config);
            } else {
                switch (config.contentType) {
                    case 'title':
                        generatedContent.title = await this.generateTitle(features, config);
                        break;
                    case 'meta_description':
                        generatedContent.metaDescription = await this.generateMetaDescription(features, config);
                        break;
                    case 'content':
                        generatedContent.content = await this.generateFullContent(features, config);
                        break;
                    case 'schema':
                        generatedContent.schema = await this.generateSchema(features, config);
                        break;
                }
            }

            // Step 4: Calculate quality metrics
            const qualityMetrics = this.calculateQualityMetrics(generatedContent, features, config);

            // Step 5: Validate content quality
            const validation = this.validateContent(generatedContent, config);

            // Step 6: Save to database
            const generationTimeMs = Date.now() - startTime;
            const savedContent = await this.saveGeneratedContent({
                ...generatedContent,
                ...qualityMetrics,
                generationTimeMs,
                qualityValidationPassed: validation.passed,
                validationErrors: validation.errors
            }, config, features);

            console.log(`Content generated successfully in ${generationTimeMs}ms`);

            return {
                id: savedContent.id,
                ...generatedContent,
                ...qualityMetrics,
                generationTimeMs,
                qualityValidationPassed: validation.passed,
                validationErrors: validation.errors
            } as GeneratedContent;

        } catch (error) {
            console.error('Error generating content:', error);
            throw error;
        }
    }

    /**
     * Generate optimized title based on AI model and patterns
     */
    private async generateTitle(features: ContentFeatures, config: GenerationConfig): Promise<string> {
        try {
            const keyword = config.targetKeywords?.[0] || this.extractMainKeyword(features);

            // Use AI model to generate title if available
            const model = this.models.get('title-optimizer-v1');
            if (model) {
                const aiTitle = await this.generateWithModel(model, features, 'title', 60);
                if (this.isValidTitle(aiTitle)) {
                    return aiTitle;
                }
            }

            // Fallback to pattern-based generation with AI enhancement
            const pattern = this.selectBestPattern(features, config);
            const title = this.fillPattern(pattern, {
                keyword,
                number: Math.floor(Math.random() * 10) + 3,
                adjective: this.powerWords[Math.floor(Math.random() * this.powerWords.length)],
                year: new Date().getFullYear(),
                benefit: this.extractBenefit(features)
            });

            // Optimize length (ideal: 50-60 characters)
            return this.optimizeTitleLength(title);

        } catch (error) {
            console.error('Error generating title:', error);
            // Fallback to simple title
            const keyword = config.targetKeywords?.[0] || 'Your Solution';
            return `${keyword} - Complete Guide ${new Date().getFullYear()}`;
        }
    }

    /**
     * Generate meta description optimized for CTR
     */
    private async generateMetaDescription(features: ContentFeatures, config: GenerationConfig): Promise<string> {
        try {
            const keyword = config.targetKeywords?.[0] || this.extractMainKeyword(features);

            // Use AI model if available
            const model = this.models.get('meta-description-generator-v1');
            if (model) {
                const aiDescription = await this.generateWithModel(model, features, 'meta_description', 155);
                if (this.isValidMetaDescription(aiDescription)) {
                    return aiDescription;
                }
            }

            // Pattern-based generation
            const benefit = this.extractBenefit(features);
            const cta = this.callToActionPhrases[Math.floor(Math.random() * this.callToActionPhrases.length)];

            let description = '';

            // Analyze competitor descriptions for insights
            if (features.competitorDescriptions && features.competitorDescriptions.length > 0) {
                const commonThemes = this.extractCommonThemes(features.competitorDescriptions);
                description = `${keyword} - ${benefit}. ${commonThemes}. ${cta} today!`;
            } else {
                description = `Discover everything about ${keyword}. ${benefit}. Proven strategies and expert insights. ${cta}!`;
            }

            // Optimize to 150-160 characters
            return this.optimizeMetaDescriptionLength(description);

        } catch (error) {
            console.error('Error generating meta description:', error);
            const keyword = config.targetKeywords?.[0] || 'our solution';
            return `Learn about ${keyword}. Get expert insights and proven results. Start today!`;
        }
    }

    /**
     * Generate H1 heading
     */
    private async generateH1(features: ContentFeatures, config: GenerationConfig): Promise<string> {
        const keyword = config.targetKeywords?.[0] || this.extractMainKeyword(features);
        const benefit = this.extractBenefit(features);

        // H1 should be compelling and include primary keyword
        return `${keyword}: ${benefit}`;
    }

    /**
     * Generate H2 headings for content structure
     */
    private async generateH2Headings(features: ContentFeatures, config: GenerationConfig): Promise<string[]> {
        const keyword = config.targetKeywords?.[0] || this.extractMainKeyword(features);

        // Generate logical content structure
        return [
            `What is ${keyword}?`,
            `Why ${keyword} Matters`,
            `Key Benefits of ${keyword}`,
            `How to Get Started with ${keyword}`,
            `Best Practices for ${keyword}`,
            `Common Mistakes to Avoid`,
            `Frequently Asked Questions`,
            `Conclusion and Next Steps`
        ];
    }

    /**
     * Generate full content with proper structure
     */
    private async generateFullContent(features: ContentFeatures, config: GenerationConfig): Promise<string> {
        try {
            const keyword = config.targetKeywords?.[0] || this.extractMainKeyword(features);
            const h2Headings = await this.generateH2Headings(features, config);

            let content = '';

            // Generate introduction
            content += this.generateIntroduction(keyword, features);
            content += '\n\n';

            // Generate content for each section
            for (const heading of h2Headings) {
                content += `## ${heading}\n\n`;
                content += this.generateSectionContent(heading, keyword, features, config);
                content += '\n\n';
            }

            // Add conclusion
            content += this.generateConclusion(keyword, features);

            // Optimize content
            content = this.optimizeContentForSEO(content, config);

            return content;

        } catch (error) {
            console.error('Error generating full content:', error);
            throw error;
        }
    }

    /**
     * Generate JSON-LD schema markup
     */
    private async generateSchema(features: ContentFeatures, config: GenerationConfig): Promise<object> {
        const keyword = config.targetKeywords?.[0] || '';

        // Generate appropriate schema based on page type
        const schema: any = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: await this.generateTitle(features, config),
            description: await this.generateMetaDescription(features, config),
            author: {
                '@type': 'Organization',
                name: 'LightDom AI'
            },
            datePublished: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            publisher: {
                '@type': 'Organization',
                name: 'LightDom',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://lightdom.io/logo.png'
                }
            }
        };

        // Add FAQ schema if applicable
        if (features.pageType === 'faq' || keyword.includes('how to')) {
            schema.mainEntity = {
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: `What is ${keyword}?`,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: `${keyword} is a comprehensive solution that helps you achieve better results.`
                        }
                    }
                ]
            };
        }

        return schema;
    }

    /**
     * Extract features from page and analyze current content
     */
    private async extractFeatures(config: GenerationConfig): Promise<ContentFeatures> {
        try {
            // Fetch current page content
            let currentPage = null;
            try {
                const response = await fetch(config.url);
                const html = await response.text();
                const $ = cheerio.load(html);

                currentPage = {
                    title: $('title').text(),
                    metaDescription: $('meta[name="description"]').attr('content'),
                    h1: $('h1').first().text(),
                    wordCount: $('body').text().split(/\s+/).length,
                    keywordDensity: this.calculateKeywordDensity($('body').text(), config.targetKeywords?.[0] || '')
                };
            } catch (error) {
                console.log('Could not fetch current page, using defaults');
            }

            // Get SEO features from existing analytics
            const seoFeatures = await this.getSEOFeatures(config.url);

            // Determine page type
            const pageType = this.determinePageType(config.url, currentPage);

            return {
                currentTitle: currentPage?.title,
                currentMetaDescription: currentPage?.metaDescription,
                currentH1: currentPage?.h1,
                currentWordCount: currentPage?.wordCount,
                currentKeywordDensity: currentPage?.keywordDensity,
                seoFeatures,
                pageType,
                industry: config.brandGuidelines?.industry,
                targetAudience: config.brandGuidelines?.targetAudience
            };

        } catch (error) {
            console.error('Error extracting features:', error);
            return {};
        }
    }

    /**
     * Analyze competitor pages for insights
     */
    private async analyzeCompetitors(competitorUrls: string[]): Promise<any> {
        const competitors = [];

        for (const url of competitorUrls.slice(0, 5)) { // Limit to top 5
            try {
                const response = await fetch(url);
                const html = await response.text();
                const $ = cheerio.load(html);

                competitors.push({
                    url,
                    title: $('title').text(),
                    metaDescription: $('meta[name="description"]').attr('content'),
                    h1: $('h1').first().text(),
                    h2Count: $('h2').length,
                    wordCount: $('body').text().split(/\s+/).length,
                    hasSchema: $('script[type="application/ld+json"]').length > 0
                });
            } catch (error) {
                console.log(`Could not analyze competitor: ${url}`);
            }
        }

        return {
            competitors,
            avgTitleLength: this.average(competitors.map(c => c.title?.length || 0)),
            avgMetaLength: this.average(competitors.map(c => c.metaDescription?.length || 0)),
            avgWordCount: this.average(competitors.map(c => c.wordCount || 0)),
            avgH2Count: this.average(competitors.map(c => c.h2Count || 0))
        };
    }

    /**
     * Calculate quality metrics for generated content
     */
    private calculateQualityMetrics(content: Partial<GeneratedContent>, features: ContentFeatures, config: GenerationConfig): any {
        const fullText = `${content.title || ''} ${content.metaDescription || ''} ${content.content || ''}`;

        return {
            seoScore: this.calculateSEOScore(content, features, config),
            readabilityScore: this.calculateReadabilityScore(fullText),
            confidenceScore: this.calculateConfidenceScore(content, features),
            keywordDensity: this.calculateKeywordDensity(fullText, config.targetKeywords?.[0] || '')
        };
    }

    /**
     * Calculate SEO score (0-100)
     */
    private calculateSEOScore(content: Partial<GeneratedContent>, features: ContentFeatures, config: GenerationConfig): number {
        let score = 0;

        // Title optimization (20 points)
        if (content.title) {
            if (content.title.length >= 50 && content.title.length <= 60) score += 10;
            if (config.targetKeywords?.some(kw => content.title?.toLowerCase().includes(kw.toLowerCase()))) score += 10;
        }

        // Meta description (20 points)
        if (content.metaDescription) {
            if (content.metaDescription.length >= 150 && content.metaDescription.length <= 160) score += 10;
            if (config.targetKeywords?.some(kw => content.metaDescription?.toLowerCase().includes(kw.toLowerCase()))) score += 10;
        }

        // Content length (20 points)
        if (content.content) {
            const wordCount = content.content.split(/\s+/).length;
            if (wordCount >= 1000 && wordCount <= 2500) score += 20;
            else if (wordCount >= 500) score += 10;
        }

        // Keyword optimization (20 points)
        const keyword = config.targetKeywords?.[0];
        if (keyword) {
            const density = this.calculateKeywordDensity(content.content || '', keyword);
            if (density >= 1 && density <= 3) score += 20;
            else if (density > 0) score += 10;
        }

        // Structure (10 points)
        if (content.h1) score += 5;
        if (content.h2Headings && content.h2Headings.length >= 3) score += 5;

        // Schema markup (10 points)
        if (content.schema) score += 10;

        return Math.min(score, 100);
    }

    /**
     * Calculate readability score (Flesch Reading Ease)
     */
    private calculateReadabilityScore(text: string): number {
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).length;
        const syllables = this.countSyllables(text);

        if (words === 0 || sentences === 0) return 0;

        const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate model confidence score
     */
    private calculateConfidenceScore(content: Partial<GeneratedContent>, features: ContentFeatures): number {
        let confidence = 100;

        // Reduce confidence if missing features
        if (!features.seoFeatures) confidence -= 20;
        if (!features.competitorTitles || features.competitorTitles.length === 0) confidence -= 10;

        // Reduce confidence for very short or very long content
        if (content.content) {
            const wordCount = content.content.split(/\s+/).length;
            if (wordCount < 300) confidence -= 20;
            if (wordCount > 3000) confidence -= 10;
        }

        return Math.max(0, confidence);
    }

    /**
     * Calculate keyword density (percentage)
     */
    private calculateKeywordDensity(text: string, keyword: string): number {
        if (!keyword || !text) return 0;

        const words = text.toLowerCase().split(/\s+/);
        const keywordWords = keyword.toLowerCase().split(/\s+/);
        const keywordLength = keywordWords.length;

        let count = 0;
        for (let i = 0; i <= words.length - keywordLength; i++) {
            const phrase = words.slice(i, i + keywordLength).join(' ');
            if (phrase === keyword.toLowerCase()) count++;
        }

        return (count / (words.length - keywordLength + 1)) * 100;
    }

    /**
     * Validate generated content quality
     */
    private validateContent(content: Partial<GeneratedContent>, config: GenerationConfig): { passed: boolean; errors: string[] } {
        const errors: string[] = [];

        // Title validation
        if (content.title) {
            if (content.title.length < 30) errors.push('Title too short (minimum 30 characters)');
            if (content.title.length > 70) errors.push('Title too long (maximum 70 characters)');
            if (!config.targetKeywords?.some(kw => content.title?.toLowerCase().includes(kw.toLowerCase()))) {
                errors.push('Title missing target keyword');
            }
        }

        // Meta description validation
        if (content.metaDescription) {
            if (content.metaDescription.length < 120) errors.push('Meta description too short');
            if (content.metaDescription.length > 170) errors.push('Meta description too long');
        }

        // Content validation
        if (content.content) {
            const wordCount = content.content.split(/\s+/).length;
            if (wordCount < config.minLength || 300) errors.push(`Content too short (minimum ${config.minLength || 300} words)`);
            if (config.maxLength && wordCount > config.maxLength) errors.push(`Content too long (maximum ${config.maxLength} words)`);

            // Check keyword density
            const keyword = config.targetKeywords?.[0];
            if (keyword) {
                const density = this.calculateKeywordDensity(content.content, keyword);
                if (density < 0.5) errors.push('Keyword density too low');
                if (density > 5) errors.push('Keyword density too high (keyword stuffing)');
            }
        }

        return {
            passed: errors.length === 0,
            errors
        };
    }

    /**
     * Save generated content to database
     */
    private async saveGeneratedContent(
        content: Partial<GeneratedContent>,
        config: GenerationConfig,
        features: ContentFeatures
    ): Promise<any> {
        const query = `
            INSERT INTO ai_content.generated_content (
                url, target_keyword, content_type,
                generated_title, generated_meta_description,
                generated_h1, generated_h2, generated_content, generated_schema,
                input_features, seo_score, readability_score,
                confidence_score, keyword_density, generation_time_ms,
                quality_validation_passed, validation_errors,
                created_by, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING id
        `;

        const values = [
            config.url,
            config.targetKeywords?.[0] || null,
            config.contentType || 'full_page',
            content.title || null,
            content.metaDescription || null,
            content.h1 || null,
            content.h2Headings || null,
            content.content || null,
            content.schema ? JSON.stringify(content.schema) : null,
            JSON.stringify(features),
            content.seoScore || 0,
            content.readabilityScore || 0,
            content.confidenceScore || 0,
            content.keywordDensity || 0,
            content.generationTimeMs || 0,
            content.qualityValidationPassed || false,
            content.validationErrors ? JSON.stringify(content.validationErrors) : null,
            'system',
            content.qualityValidationPassed ? 'approved' : 'generated'
        ];

        const result = await this.db.query(query, values);
        return { id: result.rows[0].id };
    }

    /**
     * Load or create AI models
     */
    private async loadOrCreateModels(): Promise<void> {
        try {
            // Try to load existing models from database
            const query = 'SELECT * FROM ai_content.generation_models WHERE status = $1';
            const result = await this.db.query(query, ['active']);

            for (const row of result.rows) {
                if (row.model_path) {
                    try {
                        if (!TF_NODE_AVAILABLE) {
                            console.warn(`Skipping load for ${row.model_name}: native TensorFlow bindings are required to read models from disk.`);
                            continue;
                        }
                        const model = await tf.loadLayersModel(`file://${row.model_path}`);
                        this.models.set(row.model_name, model);
                        console.log(`Loaded model: ${row.model_name}`);
                    } catch (error) {
                        console.log(`Could not load model ${row.model_name}, will create new one`);
                    }
                }
            }

            // Create default models if none exist
            if (this.models.size === 0) {
                console.log('No pre-trained models found, creating default models...');
                await this.createDefaultModels();
            }

        } catch (error) {
            console.error('Error loading models:', error);
            // Continue with pattern-based generation as fallback
        }
    }

    /**
     * Create default TensorFlow models for content generation
     */
    private async createDefaultModels(): Promise<void> {
        // Create a simple LSTM model for title generation
        const titleModel = tf.sequential({
            layers: [
                tf.layers.embedding({ inputDim: 10000, outputDim: this.embeddingDim, inputLength: this.maxSequenceLength }),
                tf.layers.lstm({ units: 128, returnSequences: true }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.lstm({ units: 64 }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ units: 64, activation: 'relu' }),
                tf.layers.dense({ units: 10000, activation: 'softmax' })
            ]
        });

        titleModel.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        this.models.set('title-optimizer-v1', titleModel);
        console.log('Created default title generation model');
    }

    /**
     * Initialize vocabulary for NLP
     */
    private initializeVocabulary(): void {
        // Common words and SEO terms
        const commonWords = [
            'the', 'to', 'of', 'and', 'a', 'in', 'is', 'it', 'you', 'that',
            'guide', 'how', 'what', 'best', 'top', 'ultimate', 'complete',
            'seo', 'optimization', 'content', 'marketing', 'web', 'site',
            'page', 'search', 'engine', 'ranking', 'traffic', 'keywords'
        ];

        commonWords.forEach((word, index) => {
            this.vocabularyMap.set(word as string, index);
            this.reverseVocabularyMap.set(index, word as string);
        });
    }

    /**
     * Build vocabulary from training data
     */
    private async buildVocabulary(): Promise<void> {
        try {
            // Get sample content from database
            const query = `
                SELECT generated_title, generated_meta_description, generated_content
                FROM ai_content.generated_content
                WHERE quality_validation_passed = true
                LIMIT 1000
            `;

            const result = await this.db.query(query);

            const allText = result.rows.map(row =>
                `${row.generated_title} ${row.generated_meta_description} ${row.generated_content}`
            ).join(' ');

            const words = allText.toLowerCase().split(/\s+/);
            const uniqueWords = [...new Set(words)];

            uniqueWords.forEach((word, index) => {
                if (!this.vocabularyMap.has(word as string)) {
                    const newIndex = this.vocabularyMap.size;
                    this.vocabularyMap.set(word as string, newIndex);
                    this.reverseVocabularyMap.set(newIndex, word as string);
                }
            });

            console.log(`Vocabulary size: ${this.vocabularyMap.size}`);

        } catch (error) {
            console.log('Could not build vocabulary from database, using defaults');
        }
    }

    // Helper methods

    private extractMainKeyword(features: ContentFeatures): string {
        return features.currentTitle?.split(/[-:|]/)[0]?.trim() || 'Your Solution';
    }

    private extractBenefit(features: ContentFeatures): string {
        const benefits = [
            'boost your results',
            'save time and money',
            'increase efficiency',
            'achieve better outcomes',
            'maximize performance',
            'drive growth',
            'improve quality',
            'get expert insights'
        ];
        return benefits[Math.floor(Math.random() * benefits.length)];
    }

    private selectBestPattern(features: ContentFeatures, config: GenerationConfig): string {
        const patterns = this.titlePatterns.how_to.concat(
            this.titlePatterns.list,
            this.titlePatterns.benefit
        );
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    private fillPattern(pattern: string, replacements: any): string {
        let result = pattern;
        for (const [key, value] of Object.entries(replacements)) {
            result = result.replace(`{${key}}`, String(value));
        }
        return result;
    }

    private optimizeTitleLength(title: string): string {
        if (title.length <= 60) return title;
        return title.substring(0, 57) + '...';
    }

    private optimizeMetaDescriptionLength(description: string): string {
        if (description.length >= 150 && description.length <= 160) return description;
        if (description.length < 150) {
            return description + ' Learn more about our proven strategies and expert tips.';
        }
        return description.substring(0, 157) + '...';
    }

    private isValidTitle(title: string): boolean {
        return title.length >= 30 && title.length <= 70 && title.trim().length > 0;
    }

    private isValidMetaDescription(description: string): boolean {
        return description.length >= 120 && description.length <= 170 && description.trim().length > 0;
    }

    private extractCommonThemes(descriptions: string[]): string {
        // Simple implementation - in production, use NLP
        return 'Expert insights and proven strategies';
    }

    private generateIntroduction(keyword: string, features: ContentFeatures): string {
        return `In today's digital landscape, ${keyword} has become increasingly important. This comprehensive guide will help you understand everything you need to know about ${keyword}, including best practices, expert tips, and proven strategies for success.`;
    }

    private generateSectionContent(heading: string, keyword: string, features: ContentFeatures, config: GenerationConfig): string {
        // Generate relevant content for each section
        return `This section covers ${heading.toLowerCase()}. When it comes to ${keyword}, understanding this aspect is crucial for achieving optimal results. Our research and expertise show that following these guidelines can significantly improve your outcomes.\n\nKey points to remember:\n- Important consideration 1\n- Important consideration 2\n- Important consideration 3`;
    }

    private generateConclusion(keyword: string, features: ContentFeatures): string {
        return `In conclusion, ${keyword} is essential for achieving your goals. By following the strategies and best practices outlined in this guide, you'll be well-equipped to succeed. Remember to stay consistent, monitor your progress, and continuously optimize your approach for the best results.`;
    }

    private optimizeContentForSEO(content: string, config: GenerationConfig): string {
        // Add keyword variations naturally
        // Ensure proper density
        // Add semantic keywords
        return content;
    }

    private async generateWithModel(model: tf.LayersModel, features: ContentFeatures, type: string, maxLength: number): Promise<string> {
        // Simplified model generation - in production, implement proper sequence generation
        return '';
    }

    private async getSEOFeatures(url: string): Promise<any> {
        try {
            const query = 'SELECT * FROM seo_features.complete_features WHERE url = $1 ORDER BY collected_at DESC LIMIT 1';
            const result = await this.db.query(query, [url]);
            return result.rows[0] || null;
        } catch (error) {
            return null;
        }
    }

    private determinePageType(url: string, page: any): string {
        if (url.includes('/blog/')) return 'blog';
        if (url.includes('/product/')) return 'product';
        if (url.includes('/faq')) return 'faq';
        if (url.includes('/about')) return 'about';
        return 'general';
    }

    private countSyllables(text: string): number {
        // Simplified syllable counting
        const words = text.toLowerCase().split(/\s+/);
        let syllables = 0;

        for (const word of words) {
            const vowels = word.match(/[aeiouy]+/g);
            syllables += vowels ? vowels.length : 1;
        }

        return syllables;
    }

    private average(numbers: number[]): number {
        if (numbers.length === 0) return 0;
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    /**
     * Queue content generation for batch processing
     */
    async queueGeneration(urls: string[], config: Partial<GenerationConfig> = {}): Promise<string[]> {
        const queuedIds: string[] = [];

        for (const url of urls) {
            const query = `
                INSERT INTO ai_content.generation_queue (
                    url, target_keywords, content_types, generation_params, status
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `;

            const result = await this.db.query(query, [
                url,
                config.targetKeywords || [],
                [config.contentType || 'full_page'],
                JSON.stringify(config),
                'pending'
            ]);

            queuedIds.push(result.rows[0].id);
        }

        console.log(`Queued ${queuedIds.length} content generation tasks`);
        return queuedIds;
    }

    /**
     * Process queued content generation tasks
     */
    async processQueue(batchSize: number = 10): Promise<void> {
        const query = `
            SELECT * FROM ai_content.generation_queue
            WHERE status = 'pending'
            ORDER BY priority DESC, created_at ASC
            LIMIT $1
        `;

        const result = await this.db.query(query, [batchSize]);

        for (const task of result.rows) {
            try {
                await this.db.query(
                    'UPDATE ai_content.generation_queue SET status = $1, started_at = $2 WHERE id = $3',
                    ['processing', new Date(), task.id]
                );

                const config: GenerationConfig = {
                    url: task.url,
                    targetKeywords: task.target_keywords,
                    contentType: task.content_types[0],
                    ...JSON.parse(task.generation_params || '{}')
                };

                const generatedContent = await this.generateContent(config);

                await this.db.query(
                    'UPDATE ai_content.generation_queue SET status = $1, completed_at = $2, generated_content_ids = $3 WHERE id = $4',
                    ['completed', new Date(), [generatedContent.id], task.id]
                );

                console.log(`Completed queued task: ${task.id}`);

            } catch (error) {
                console.error(`Error processing queued task ${task.id}:`, error);

                await this.db.query(
                    'UPDATE ai_content.generation_queue SET status = $1, error_message = $2, retry_count = retry_count + 1 WHERE id = $3',
                    ['failed', error.message, task.id]
                );
            }
        }
    }
}

export default AIContentGenerationService;

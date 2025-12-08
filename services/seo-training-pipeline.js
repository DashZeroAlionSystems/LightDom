/**
 * SEO Training Data Pipeline
 * Orchestrates extraction, storage, and training data generation
 */

import pg from 'pg';
import { extractSEOAttributes } from './seo-attribute-extractor.js';

const { Pool } = pg;

export class SEOTrainingPipeline {
  constructor(config = {}) {
    this.db =
      config.db ||
      new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
      });
    this.embeddingService = config.embeddingService; // Optional: service to generate embeddings
    this.logger = config.logger || console;
  }

  /**
   * Process a crawled page and extract SEO attributes
   * @param {Object} params
   * @param {string} params.url - Page URL
   * @param {string} params.html - HTML content
   * @param {string} params.crawlSessionId - Crawler session ID
   * @returns {Promise<Object>} Stored attributes with ID
   */
  async processPage({ url, html, crawlSessionId }) {
    try {
      this.logger.info(`[SEO Pipeline] Processing ${url}`);

      // Extract attributes
      const attributes = await extractSEOAttributes(html, url);

      // Generate embedding if service available
      let embedding = null;
      if (this.embeddingService) {
        try {
          const embeddingInput = this.buildEmbeddingInput(attributes);
          embedding = await this.embeddingService.embed(embeddingInput);
        } catch (embErr) {
          this.logger.warn(
            `[SEO Pipeline] Embedding generation failed for ${url}:`,
            embErr.message
          );
        }
      }

      // Store in database
      const storedId = await this.storeAttributes(attributes, embedding, crawlSessionId);

      this.logger.info(`[SEO Pipeline] Stored attributes for ${url} (ID: ${storedId})`);

      return { id: storedId, attributes, embedding };
    } catch (error) {
      this.logger.error(`[SEO Pipeline] Failed to process ${url}:`, error);
      throw error;
    }
  }

  /**
   * Build embedding input from attributes
   */
  buildEmbeddingInput(attributes) {
    // Combine key textual fields for embedding
    const parts = [
      attributes.title || '',
      attributes.metaDescription || '',
      attributes.h1Text || '',
      attributes.h2Text || '',
      attributes.metaKeywords || '',
    ];
    return parts.filter(Boolean).join(' ').trim();
  }

  /**
   * Store SEO attributes in database
   */
  async storeAttributes(attributes, embedding, crawlSessionId) {
    const query = `
      INSERT INTO seo_attributes (
        url, crawl_session_id, timestamp,
        title, title_length, meta_description, meta_description_length,
        meta_keywords, meta_author, meta_robots, meta_viewport,
        canonical, alternate, prev_url, next_url,
        og_title, og_description, og_image, og_url, og_type, og_site_name, og_locale,
        twitter_card, twitter_site, twitter_creator, twitter_title, twitter_description, twitter_image,
        lang, charset, favicon, apple_touch_icon,
        h1_count, h2_count, h3_count, h4_count, h5_count, h6_count,
        h1_text, h2_text, h3_text, total_headings, heading_hierarchy_valid,
        body_text_length, word_count, paragraph_count, list_count, list_item_count,
        table_count, form_count, input_count, button_count, textarea_count, select_count,
        sentence_count, avg_words_per_sentence,
        total_links, internal_links_count, external_links_count, anchor_links_count,
        nofollow_links_count, dofollow_links_count, internal_to_external_ratio, empty_href_count,
        total_images, images_with_alt, images_without_alt, images_with_title,
        images_with_lazy_load, alt_text_coverage,
        structured_data_count, schema_types, has_article_schema, has_product_schema,
        has_organization_schema, has_breadcrumb_schema, itemscope_count, itemprop_count,
        html_size, css_link_count, js_script_count, inline_script_count, inline_style_count,
        prefetch_count, preconnect_count, preload_count, dns_preconnect_count,
        has_viewport_meta, has_apple_mobile_web_app_capable, has_theme_color,
        aria_label_count, aria_describedby_count, role_count, accessibility_score,
        protocol, hostname, pathname, pathname_length, path_depth,
        has_query_params, query_param_count, has_fragment, is_secure,
        facebook_count, twitter_count, linkedin_count, instagram_count,
        youtube_count, pinterest_count, social_share_count,
        has_https_in_links, has_insecure_content, has_iframe, iframe_count,
        has_external_scripts, has_crossorigin_links,
        seo_score, content_quality_score, technical_score, overall_score,
        embedding, raw_attributes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41,
        $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54,
        $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67,
        $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80,
        $81, $82, $83, $84, $85, $86, $87, $88, $89, $90, $91, $92, $93,
        $94, $95, $96, $97, $98, $99, $100, $101, $102, $103, $104, $105,
        $106, $107, $108, $109, $110, $111, $112, $113, $114, $115, $116,
        $117, $118, $119, $120
      ) RETURNING id
    `;

    const values = [
      attributes.url,
      crawlSessionId,
      attributes.timestamp,
      attributes.title,
      attributes.titleLength,
      attributes.metaDescription,
      attributes.metaDescriptionLength,
      attributes.metaKeywords,
      attributes.metaAuthor,
      attributes.metaRobots,
      attributes.metaViewport,
      attributes.canonical,
      attributes.alternate,
      attributes.prev || attributes.prevUrl, // Handle both property names
      attributes.next || attributes.nextUrl,
      attributes.ogTitle,
      attributes.ogDescription,
      attributes.ogImage,
      attributes.ogUrl,
      attributes.ogType,
      attributes.ogSiteName,
      attributes.ogLocale,
      attributes.twitterCard,
      attributes.twitterSite,
      attributes.twitterCreator,
      attributes.twitterTitle,
      attributes.twitterDescription,
      attributes.twitterImage,
      attributes.lang,
      attributes.charset,
      attributes.favicon,
      attributes.appleTouchIcon,
      attributes.h1Count,
      attributes.h2Count,
      attributes.h3Count,
      attributes.h4Count,
      attributes.h5Count,
      attributes.h6Count,
      attributes.h1Text,
      attributes.h2Text,
      attributes.h3Text,
      attributes.totalHeadings,
      attributes.headingHierarchyValid,
      attributes.bodyTextLength,
      attributes.wordCount,
      attributes.paragraphCount,
      attributes.listCount,
      attributes.listItemCount,
      attributes.tableCount,
      attributes.formCount,
      attributes.inputCount,
      attributes.buttonCount,
      attributes.textareaCount,
      attributes.selectCount,
      attributes.sentenceCount,
      attributes.avgWordsPerSentence,
      attributes.totalLinks,
      attributes.internalLinksCount,
      attributes.externalLinksCount,
      attributes.anchorLinksCount,
      attributes.noFollowLinksCount,
      attributes.doFollowLinksCount,
      attributes.internalToExternalRatio,
      attributes.emptyHrefCount,
      attributes.totalImages,
      attributes.imagesWithAlt,
      attributes.imagesWithoutAlt,
      attributes.imagesWithTitle,
      attributes.imagesWithLazyLoad,
      attributes.altTextCoverage,
      attributes.structuredDataCount,
      attributes.schemaTypes,
      attributes.hasArticleSchema,
      attributes.hasProductSchema,
      attributes.hasOrganizationSchema,
      attributes.hasBreadcrumbSchema,
      attributes.itemScopeCount,
      attributes.itemPropCount,
      attributes.htmlSize,
      attributes.cssLinkCount,
      attributes.jsScriptCount,
      attributes.inlineScriptCount,
      attributes.inlineStyleCount,
      attributes.prefetchCount,
      attributes.preconnectCount,
      attributes.preloadCount,
      attributes.dnsPreconnectCount,
      attributes.hasViewportMeta,
      attributes.hasAppleMobileWebAppCapable,
      attributes.hasThemeColor,
      attributes.ariaLabelCount,
      attributes.ariaDescribedByCount,
      attributes.roleCount,
      attributes.accessibilityScore,
      attributes.protocol,
      attributes.hostname,
      attributes.pathname,
      attributes.pathnameLength,
      attributes.pathDepth,
      attributes.hasQueryParams,
      attributes.queryParamCount,
      attributes.hasFragment,
      attributes.isSecure,
      attributes.facebookCount,
      attributes.twitterCount,
      attributes.linkedinCount,
      attributes.instagramCount,
      attributes.youtubeCount,
      attributes.pinterestCount,
      attributes.socialShareCount,
      attributes.hasHttpsInLinks,
      attributes.hasInsecureContent,
      attributes.hasIframe,
      attributes.iframeCount,
      attributes.hasExternalScripts,
      attributes.hasCrossOriginLinks,
      attributes.seoScore,
      attributes.contentQualityScore,
      attributes.technicalScore,
      attributes.overallScore,
      embedding ? JSON.stringify(embedding) : null, // JSONB format instead of vector
      JSON.stringify(attributes),
    ];

    const result = await this.db.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Generate training dataset from stored attributes
   * @param {Object} params
   * @param {string} params.datasetName - Name for the dataset
   * @param {number} params.minScore - Minimum overall score filter
   * @param {number} params.maxScore - Maximum overall score filter
   * @param {string[]} params.hostnameFilter - Optional hostname whitelist
   * @param {number} params.limit - Max samples to include
   * @returns {Promise<Object>} Dataset metadata
   */
  async generateTrainingDataset({
    datasetName,
    minScore = 0,
    maxScore = 100,
    hostnameFilter = null,
    limit = 10000,
  }) {
    try {
      this.logger.info(`[SEO Pipeline] Generating training dataset: ${datasetName}`);

      // Create dataset record
      const datasetId = await this.createDatasetRecord({
        datasetName,
        minScore,
        maxScore,
        hostnameFilter,
      });

      // Query attributes
      let query = `
        SELECT * FROM seo_attributes
        WHERE overall_score >= $1 AND overall_score <= $2
      `;
      const params = [minScore, maxScore];
      let paramIndex = 3;

      if (hostnameFilter && hostnameFilter.length > 0) {
        query += ` AND hostname = ANY($${paramIndex})`;
        params.push(hostnameFilter);
        paramIndex++;
      }

      query += ` ORDER BY timestamp DESC LIMIT $${paramIndex}`;
      params.push(limit);

      const result = await this.db.query(query, params);

      this.logger.info(`[SEO Pipeline] Retrieved ${result.rows.length} samples`);

      // Prepare features and labels
      const { features, labels } = this.prepareMLData(result.rows);

      // Split train/test (80/20)
      const trainTestSplit = this.splitTrainTest(features, labels);

      // Update dataset record
      await this.updateDatasetRecord(datasetId, {
        sampleCount: result.rows.length,
        features: { columns: Object.keys(features[0] || {}) },
        labels: { columns: Object.keys(labels[0] || {}) },
        trainTestSplit: {
          trainSize: trainTestSplit.train.features.length,
          testSize: trainTestSplit.test.features.length,
        },
        status: 'complete',
      });

      this.logger.info(`[SEO Pipeline] Dataset ${datasetName} generated successfully`);

      return {
        datasetId,
        datasetName,
        sampleCount: result.rows.length,
        trainTestSplit,
      };
    } catch (error) {
      this.logger.error(`[SEO Pipeline] Failed to generate dataset:`, error);
      throw error;
    }
  }

  /**
   * Create dataset record in database
   */
  async createDatasetRecord({ datasetName, minScore, maxScore, hostnameFilter }) {
    const query = `
      INSERT INTO seo_training_data (
        dataset_name, min_overall_score, max_overall_score,
        hostname_filter, status
      ) VALUES ($1, $2, $3, $4, 'processing')
      RETURNING id
    `;
    const result = await this.db.query(query, [datasetName, minScore, maxScore, hostnameFilter]);
    return result.rows[0].id;
  }

  /**
   * Update dataset record
   */
  async updateDatasetRecord(datasetId, updates) {
    const query = `
      UPDATE seo_training_data
      SET sample_count = $2,
          features = $3,
          labels = $4,
          train_test_split = $5,
          status = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await this.db.query(query, [
      datasetId,
      updates.sampleCount,
      updates.features,
      updates.labels,
      updates.trainTestSplit,
      updates.status,
    ]);
  }

  /**
   * Prepare ML features and labels from raw attributes
   */
  prepareMLData(rows) {
    const features = [];
    const labels = [];

    for (const row of rows) {
      // Feature vector (numeric/normalized fields)
      features.push({
        titleLength: row.title_length || 0,
        metaDescriptionLength: row.meta_description_length || 0,
        wordCount: row.word_count || 0,
        h1Count: row.h1_count || 0,
        h2Count: row.h2_count || 0,
        totalHeadings: row.total_headings || 0,
        paragraphCount: row.paragraph_count || 0,
        internalLinksCount: row.internal_links_count || 0,
        externalLinksCount: row.external_links_count || 0,
        totalImages: row.total_images || 0,
        altTextCoverage: parseFloat(row.alt_text_coverage) || 0,
        structuredDataCount: row.structured_data_count || 0,
        isSecure: row.is_secure ? 1 : 0,
        hasViewportMeta: row.has_viewport_meta ? 1 : 0,
        accessibilityScore: parseFloat(row.accessibility_score) || 0,
        htmlSize: row.html_size || 0,
      });

      // Label vector (scores to predict or classify)
      labels.push({
        seoScore: parseFloat(row.seo_score) || 0,
        contentQualityScore: parseFloat(row.content_quality_score) || 0,
        technicalScore: parseFloat(row.technical_score) || 0,
        overallScore: parseFloat(row.overall_score) || 0,
      });
    }

    return { features, labels };
  }

  /**
   * Split data into train/test sets (80/20)
   */
  splitTrainTest(features, labels, testRatio = 0.2) {
    const n = features.length;
    const testSize = Math.floor(n * testRatio);
    const trainSize = n - testSize;

    // Simple random shuffle
    const indices = Array.from({ length: n }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const trainIndices = indices.slice(0, trainSize);
    const testIndices = indices.slice(trainSize);

    return {
      train: {
        features: trainIndices.map(i => features[i]),
        labels: trainIndices.map(i => labels[i]),
      },
      test: {
        features: testIndices.map(i => features[i]),
        labels: testIndices.map(i => labels[i]),
      },
    };
  }

  /**
   * Search similar pages by embedding (JSONB-based similarity)
   */
  async searchSimilarPages(queryEmbedding, topK = 10) {
    // Without pgvector, we'll do basic cosine similarity in JS
    // In production, consider using pgvector or external vector DB
    const query = `
      SELECT id, url, title, overall_score, embedding
      FROM seo_attributes
      WHERE embedding IS NOT NULL
      LIMIT 100
    `;
    const result = await this.db.query(query);

    // Calculate cosine similarity in-memory
    const withScores = result.rows.map(row => {
      const embedding = JSON.parse(row.embedding);
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      return { ...row, similarity };
    });

    // Sort by similarity and return top K
    withScores.sort((a, b) => b.similarity - a.similarity);
    return withScores.slice(0, topK).map(({ embedding, ...rest }) => rest);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async close() {
    await this.db.end();
  }
}

export default SEOTrainingPipeline;

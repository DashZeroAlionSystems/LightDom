/**
 * Simplified SEO Training Pipeline - Basic version
 * Stores essential SEO attributes without complex mappings
 */

import pg from 'pg';
import { extractSEOAttributes } from './seo-attribute-extractor.js';
import { getAttributeNames, getSEOConfig } from './seo-config-reader.js';

const { Pool } = pg;

export class SEOTrainingPipelineSimple {
  constructor(config = {}) {
    this.db =
      config.db ||
      new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
      });
    this.logger = config.logger || console;
    this.attributeNames = getAttributeNames();
    this.configMetadata = getSEOConfig().metadata || {};
    this.attributeSyncPromise = null;
  }

  /**
   * Process a crawled page and extract SEO attributes (simplified)
   */
  async processPage({ url, html, crawlSessionId }) {
    const startTime = Date.now();
    try {
      await this.ensureConfigSynced();
      this.logger.info(`[SEO Pipeline] Processing ${url}`);

      const attributes = await extractSEOAttributes(html, url);

      // Guarantee every configured attribute exists in payload
      this.ensureAllAttributes(attributes);

      // Store simplified version
      const storedId = await this.storeAttributesSimple(attributes, crawlSessionId);

      const scores = {
        seo: attributes.seoScore ?? null,
        content: attributes.contentQualityScore ?? null,
        technical: attributes.technicalScore ?? null,
        overall: attributes.overallScore ? parseFloat(attributes.overallScore) : null,
      };

      const missingAttributes = this.attributeNames.filter(
        name => attributes[name] === null || attributes[name] === undefined
      );

      this.logger.info(
        `[SEO Pipeline] Stored ${this.attributeNames.length - missingAttributes.length}/${this.attributeNames.length} attributes for ${url} (ID: ${storedId})`
      );

      if (missingAttributes.length > 0) {
        this.logger.warn(
          `[SEO Pipeline] Missing ${missingAttributes.length} configured attributes for ${url}`
        );
      }

      return {
        seoAttributesId: storedId,
        attributes,
        scores,
        processingTime: Date.now() - startTime,
        missingAttributes,
      };
    } catch (error) {
      this.logger.error(`[SEO Pipeline] Failed to process ${url}:`, error);
      throw error;
    }
  }

  /**
   * Store attributes using dynamic query building
   */
  async storeAttributesSimple(attributes, crawlSessionId) {
    // Map attribute names to database columns
    const columnMap = {
      url: 'url',
      timestamp: 'timestamp',
      title: 'title',
      titleLength: 'title_length',
      metaDescription: 'meta_description',
      metaDescriptionLength: 'meta_description_length',
      metaKeywords: 'meta_keywords',
      metaAuthor: 'meta_author',
      metaRobots: 'meta_robots',
      metaViewport: 'meta_viewport',
      canonical: 'canonical',
      alternate: 'alternate',
      prev: 'prev_url',
      next: 'next_url',
      ogTitle: 'og_title',
      ogDescription: 'og_description',
      ogImage: 'og_image',
      ogUrl: 'og_url',
      ogType: 'og_type',
      ogSiteName: 'og_site_name',
      ogLocale: 'og_locale',
      twitterCard: 'twitter_card',
      twitterSite: 'twitter_site',
      twitterCreator: 'twitter_creator',
      twitterTitle: 'twitter_title',
      twitterDescription: 'twitter_description',
      twitterImage: 'twitter_image',
      lang: 'lang',
      charset: 'charset',
      favicon: 'favicon',
      appleTouchIcon: 'apple_touch_icon',
      h1Count: 'h1_count',
      h2Count: 'h2_count',
      h3Count: 'h3_count',
      h4Count: 'h4_count',
      h5Count: 'h5_count',
      h6Count: 'h6_count',
      h1Text: 'h1_text',
      h2Text: 'h2_text',
      h3Text: 'h3_text',
      totalHeadings: 'total_headings',
      headingHierarchyValid: 'heading_hierarchy_valid',
      bodyTextLength: 'body_text_length',
      wordCount: 'word_count',
      paragraphCount: 'paragraph_count',
      listCount: 'list_count',
      listItemCount: 'list_item_count',
      tableCount: 'table_count',
      formCount: 'form_count',
      inputCount: 'input_count',
      buttonCount: 'button_count',
      textareaCount: 'textarea_count',
      selectCount: 'select_count',
      sentenceCount: 'sentence_count',
      avgWordsPerSentence: 'avg_words_per_sentence',
      totalLinks: 'total_links',
      internalLinksCount: 'internal_links_count',
      externalLinksCount: 'external_links_count',
      anchorLinksCount: 'anchor_links_count',
      noFollowLinksCount: 'nofollow_links_count',
      doFollowLinksCount: 'dofollow_links_count',
      internalToExternalRatio: 'internal_to_external_ratio',
      emptyHrefCount: 'empty_href_count',
      totalImages: 'total_images',
      imagesWithAlt: 'images_with_alt',
      imagesWithoutAlt: 'images_without_alt',
      imagesWithTitle: 'images_with_title',
      imagesWithLazyLoad: 'images_with_lazy_load',
      altTextCoverage: 'alt_text_coverage',
      structuredDataCount: 'structured_data_count',
      schemaTypes: 'schema_types',
      hasArticleSchema: 'has_article_schema',
      hasProductSchema: 'has_product_schema',
      hasOrganizationSchema: 'has_organization_schema',
      hasBreadcrumbSchema: 'has_breadcrumb_schema',
      itemScopeCount: 'itemscope_count',
      itemPropCount: 'itemprop_count',
      htmlSize: 'html_size',
      cssLinkCount: 'css_link_count',
      jsScriptCount: 'js_script_count',
      inlineScriptCount: 'inline_script_count',
      inlineStyleCount: 'inline_style_count',
      prefetchCount: 'prefetch_count',
      preconnectCount: 'preconnect_count',
      preloadCount: 'preload_count',
      dnsPreconnectCount: 'dns_preconnect_count',
      hasViewportMeta: 'has_viewport_meta',
      hasAppleMobileWebAppCapable: 'has_apple_mobile_web_app_capable',
      hasThemeColor: 'has_theme_color',
      ariaLabelCount: 'aria_label_count',
      ariaDescribedByCount: 'aria_describedby_count',
      roleCount: 'role_count',
      accessibilityScore: 'accessibility_score',
      protocol: 'protocol',
      hostname: 'hostname',
      pathname: 'pathname',
      pathnameLength: 'pathname_length',
      pathDepth: 'path_depth',
      hasQueryParams: 'has_query_params',
      queryParamCount: 'query_param_count',
      hasFragment: 'has_fragment',
      isSecure: 'is_secure',
      facebookCount: 'facebook_count',
      twitterCount: 'twitter_count',
      linkedinCount: 'linkedin_count',
      instagramCount: 'instagram_count',
      youtubeCount: 'youtube_count',
      pinterestCount: 'pinterest_count',
      socialShareCount: 'social_share_count',
      hasHttpsInLinks: 'has_https_in_links',
      hasInsecureContent: 'has_insecure_content',
      hasIframe: 'has_iframe',
      iframeCount: 'iframe_count',
      hasExternalScripts: 'has_external_scripts',
      hasCrossOriginLinks: 'has_crossorigin_links',
      seoScore: 'seo_score',
      contentQualityScore: 'content_quality_score',
      technicalScore: 'technical_score',
      overallScore: 'overall_score',
    };

    // Build columns and values dynamically
    const columns = ['crawl_session_id', 'raw_attributes'];
    const values = [crawlSessionId, JSON.stringify(attributes)];
    let paramIndex = 3;

    for (const [attrName, dbColumn] of Object.entries(columnMap)) {
      if (attributes[attrName] !== undefined) {
        columns.push(dbColumn);
        values.push(attributes[attrName]);
      }
    }

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
      INSERT INTO seo_attributes (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING id
    `;

    const result = await this.db.query(query, values);
    return result.rows[0].id;
  }

  async close() {
    await this.db.end();
  }

  ensureAllAttributes(attributes) {
    for (const attributeName of this.attributeNames) {
      if (!(attributeName in attributes)) {
        attributes[attributeName] = null;
      }
    }
    return attributes;
  }

  async ensureConfigSynced() {
    if (!this.attributeSyncPromise) {
      this.attributeSyncPromise = this.syncAttributeConfigurations().catch(error => {
        this.logger.warn('[SEO Pipeline] Attribute configuration sync failed:', error.message);
        this.attributeSyncPromise = null;
      });
    }

    return this.attributeSyncPromise;
  }

  async syncAttributeConfigurations() {
    const config = getSEOConfig();
    const attributes = config.attributes || {};

    if (!attributes || Object.keys(attributes).length === 0) {
      this.logger.warn('[SEO Pipeline] No attribute configurations found in config file.');
      return;
    }

    const configVersion = parseInt((config.metadata?.version || '1').split('.')[0], 10) || 1;

    const client = await this.db.connect();
    try {
      const placeholders = [];
      const values = [];
      let index = 1;

      for (const [attributeName, attributeConfig] of Object.entries(attributes)) {
        placeholders.push(`($${index++}, $${index++}, $${index++}, true)`);
        values.push(attributeName, JSON.stringify(attributeConfig), configVersion);
      }

      if (placeholders.length === 0) {
        return;
      }

      const query = `
        INSERT INTO attribute_configurations (attribute_name, config, version, active)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (attribute_name)
        DO UPDATE SET
          config = EXCLUDED.config,
          version = EXCLUDED.version,
          active = true,
          updated_at = CURRENT_TIMESTAMP;
      `;

      await client.query(query, values);
      this.logger.info('[SEO Pipeline] Attribute configuration synced to database.');
      this.attributeNames = getAttributeNames();

      try {
        await client.query('SELECT refresh_seo_attribute_category_views();');
        this.logger.info('[SEO Pipeline] Category configuration views refreshed.');
      } catch (refreshError) {
        if (refreshError.code !== '42883') {
          this.logger.warn(
            '[SEO Pipeline] Unable to refresh category config views:',
            refreshError.message
          );
        }
      }
    } catch (error) {
      if (error.code === '42P01') {
        this.logger.warn(
          '[SEO Pipeline] attribute_configurations table missing; skipping configuration sync.'
        );
        return;
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

export default SEOTrainingPipelineSimple;
